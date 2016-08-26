Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization


Public Class cobdet1
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        Dim cob As Integer = Integer.Parse(
            context.Request.QueryString("cob"))

        Dim db As New mbpDataContext

        Dim cobdetQuery =
            From cd In db.cobdets Where cd.COBRANZA = cob
            Select New With {
                .ID = cd.id,
                .FECHA = String.Format("{0}/{1}/{2}", cd.USUFECHA.Value.Day, cd.USUFECHA.Value.Month, cd.USUFECHA.Value.Year),
                .IMPORTE = cd.IMPORTE.Value,
                .ABONO = cd.ABONO.Value
                }

        Dim json As New JavaScriptSerializer
        context.Response.StatusCode = 200
        context.Response.Write(json.Serialize(cobdetQuery))



    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class