Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization

Public Class login1
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest
        Dim success As Boolean = False
        Dim userId As String = ""

        If context.Request.QueryString("user") Is Nothing Then
            success = False
        Else
            Dim decPassword As String = ""
            userId = context.Request.QueryString("user")

            Dim EncPassword As String = ""

            If context.Request.QueryString("password") IsNot Nothing Then
                EncPassword = HttpUtility.UrlDecode(
                    context.Request.QueryString("password"))

            End If

            If EncPassword = "" Then
                decPassword = ""
            Else
                Dim bytes As Byte() =
                    System.Text.Encoding.ASCII.GetBytes(EncPassword)

                For Each b In bytes
                    Dim decByte = b + 12
                    decPassword &= Convert.ToChar(decByte)

                Next

            End If

            Dim db As New mbpDataContext
            Dim u = db.usuarios.SingleOrDefault(Function(_u) _u.USUARIO = userid)

            If u IsNot Nothing Then
                If u.clave = decPassword Then
                    success = True
                Else
                    success = False
                End If
            Else
                success = False
            End If

        End If

        Dim json As New JavaScriptSerializer
        context.Response.Write(json.Serialize(New With {.success = success}))

    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class