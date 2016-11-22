Imports System.Web
Imports System.Web.Services
Imports Newtonsoft.Json.Linq
Imports System.Web.Script.Serialization

Public Class cob
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        Dim db As New mbpDataContext
        Dim operation As Integer

        Dim client = context.Request.QueryString("client")
        Dim vend = context.Request.QueryString("vend")
        client = HttpUtility.UrlDecode(client)


        Dim take As Integer = 20
        Dim start As String = ""

        If context.Request.QueryString("take") IsNot Nothing Then
            take = Integer.Parse(context.Request.QueryString("take"))
            operation = 1
        End If

        If context.Request.QueryString("start") IsNot Nothing And (Not context.Request.QueryString("start") = "") Then
            take = Integer.Parse(context.Request.QueryString("take"))
            start = context.Request.QueryString("start")
            operation = 2
        End If

        Select Case operation
            Case 1
                Dim cobQuery =
                From c In db.cobranzas
                Where c.CLIENTE = client And c.SALDO > 0
                Select New With {
                    .COBRANZA = c.COBRANZA,
                    .CLIENTE = c.CLIENTE,
                    .VENTA = c.VENTA,
                    .TIPO_DOC = c.TIPO_DOC,
                    .NO_REFEREN = c.NO_REFEREN,
                    .IMPORTE = c.IMPORTE,
                    .SALDO = c.SALDO,
                    .FECHA_VENC = c.FECHA_VENC.Value.ToShortDateString,
                    .fecha = c.FECHA
                } Take take

                context.Response.StatusCode = 200
                Dim json As New JavaScriptSerializer
                context.Response.Write(json.Serialize(cobQuery))
            Case 2
                Dim cobQuery =
                From c In db.cobranzas
                Where c.CLIENTE = client And c.SALDO > 0 And c.COBRANZA >= start
                Select New With {
                    .COBRANZA = c.COBRANZA,
                    .CLIENTE = c.CLIENTE,
                    .VENTA = c.VENTA,
                    .TIPO_DOC = c.TIPO_DOC,
                    .NO_REFEREN = c.NO_REFEREN,
                    .IMPORTE = c.IMPORTE,
                    .SALDO = c.SALDO,
                    .FECHA_VENC = c.FECHA_VENC.Value.ToShortDateString
                } Take take

                context.Response.StatusCode = 200
                Dim json As New JavaScriptSerializer
                context.Response.Write(json.Serialize(cobQuery))

            Case Else
                Dim cobQuery =
                From c In db.cobranzas
                Where c.CLIENTE = client And c.SALDO > 0
                Select New With {
                    .COBRANZA = c.COBRANZA,
                    .CLIENTE = c.CLIENTE,
                    .VENTA = c.VENTA,
                    .TIPO_DOC = c.TIPO_DOC,
                    .NO_REFEREN = c.NO_REFEREN,
                    .IMPORTE = c.IMPORTE,
                    .SALDO = c.SALDO,
                    .FECHA_VENC = c.FECHA_VENC.Value.ToShortDateString
                }

                context.Response.StatusCode = 200
                Dim json As New JavaScriptSerializer
                context.Response.Write(json.Serialize(cobQuery))
        End Select


    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class