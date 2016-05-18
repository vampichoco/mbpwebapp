Imports System.Web
Imports System.Web.Services
Imports Newtonsoft.Json.Linq

Public Class Handler1
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest


        'For Each key In context.Request.Params.Keys
        '    Dim item = context.Request.Item(key)

        '    context.Response.Write(String.Format("{0}={1}<br />", key, item))

        'Next


        With context
            .Request.InputStream.Seek(0, 0)

            '.Response.Write(.Request.InputStream.Length)
            Dim reader As New System.IO.StreamReader(.Request.InputStream)
            Dim inputString As String =
                reader.ReadToEnd()

            '.Response.Write(inputString)

            Dim j As JObject = JObject.Parse(inputString)
            Dim dn = j("DayName").ToString()

            Debug.Write("<        " & dn & "             >")


        End With



    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class